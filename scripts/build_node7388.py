"""Reproducible NODE_7388 hard-surface authoring. Run with Blender, no add-ons.

Design coordinates are glTF Y-up; Blender receives an explicit Z-up conversion.
All joining is restricted to ONE assembly AND ONE material. No moving boundaries
are merged. Source bevelled parts remain in a hidden authoring collection.
"""
import bpy
import bmesh
import math
import json
import shutil
from pathlib import Path
from mathutils import Matrix, Vector
from collections import defaultdict
from array import array

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/node-7388'
PUBLIC = ROOT / 'public/models'
OUT.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for datablock in list(bpy.data.materials):
    bpy.data.materials.remove(datablock)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0  # Blender and glTF use the same units; web stage can scale uniformly.
scene.render.engine = 'CYCLES'
scene.cycles.samples = 48
scene.world.color = (0.7, 0.75, 0.8)
scene.view_settings.view_transform = 'AgX'
C = Matrix.Rotation(math.pi / 2, 4, 'X')
AXES = {'FACE_WEB': (0,0,1), 'FACE_API': (0,0,-1), 'FACE_AI': (1,0,0),
        'FACE_DATA': (-1,0,0), 'FACE_SYSTEM': (0,1,0), 'FACE_INFRA': (0,-1,0)}
parts = defaultdict(list)

def material(name, color, metal=0, rough=.3, transmission=0, alpha=1, emission=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.use_backface_culling = True  # closed volumes: never hide missing backs with double-sided shading
    p = mat.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, alpha)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    p.inputs['Transmission Weight'].default_value = transmission
    p.inputs['IOR'].default_value = 1.46
    p.inputs['Alpha'].default_value = alpha
    p.inputs['Emission Color'].default_value = (*color, 1)
    p.inputs['Emission Strength'].default_value = emission
    mat.diffuse_color = (*color, alpha)
    return mat

M = {
    'MAT_ACRYLIC': material('MAT_ACRYLIC', (.86,.95,1), rough=.13, transmission=.96),
    'MAT_CHROME': material('MAT_CHROME', (.62,.70,.78), metal=.92, rough=.23),
    'MAT_GRAPHITE': material('MAT_GRAPHITE', (.019,.027,.042), metal=.45, rough=.32),
    'MAT_PCB': material('MAT_PCB', (.018,.040,.054), metal=.28, rough=.39),
    'MAT_CIRCUIT': material('MAT_CIRCUIT', (0,.55,1), metal=.18, rough=.26, emission=1.2),
    'MAT_SMOKED_GLASS': material('MAT_SMOKED_GLASS', (.10,.16,.24), rough=.2, transmission=.78),
}

# One small reusable circuit atlas, generated from deterministic 45-degree paths.
# Fine traces are pixels, not hundreds of meshes. UVs are authored before joining.
N = 512
pixels = array('f', [0,0,0,1]) * (N*N)
def line(x0,y0,x1,y1,width=1):
    steps = max(abs(x1-x0),abs(y1-y0),1)
    for s in range(steps+1):
        x,y = round(x0+(x1-x0)*s/steps),round(y0+(y1-y0)*s/steps)
        for dx in range(-width,width+1):
            for dy in range(-width,width+1):
                if 0 <= x+dx < N and 0 <= y+dy < N:
                    i=((y+dy)*N+x+dx)*4
                    pixels[i:i+4]=array('f',[.0,.55,1,1])
for edge in range(4):
    def rotate(p):
        x,y=p
        for _ in range(edge): x,y=N-1-y,x
        return x,y
    for lane in range(5):
        a=20+lane*7
        path=[(80+lane*13,a),(320-lane*12,a),(340-lane*12,a+20),(426,a+20)]
        for p,q in zip(path,path[1:]): line(*rotate(p),*rotate(q),width=0)
        x,y=rotate(path[-1]);line(x-2,y,x+2,y,1)
image=bpy.data.images.new('NODE_CIRCUIT_MASK',N,N,alpha=True)
image.pixels.foreach_set(pixels)
image.filepath_raw=str(OUT/'circuit-mask.png');image.file_format='PNG';image.save();image.pack()
mat=M['MAT_PCB'];nodes=mat.node_tree.nodes;links=mat.node_tree.links
tex=nodes.new('ShaderNodeTexImage');tex.image=image
bsdf=nodes.get('Principled BSDF')
links.new(tex.outputs['Color'],bsdf.inputs['Emission Color'])
bsdf.inputs['Emission Strength'].default_value=.8

def empty(name, parent=None, matrix=None):
    o=bpy.data.objects.new(name,None);scene.collection.objects.link(o)
    o.empty_display_type='PLAIN_AXES';o.empty_display_size=.16
    o.parent=parent
    if matrix is not None:o.matrix_local=matrix
    return o

root=empty('NODE_7388')
root['version']='1.0';root['design_unit_meters']=1.0
root['contract']='Y-up glTF. Six rigid axial assemblies. Rest = assembled.'
groups={}
for name,axis in AXES.items():
    v=Vector(axis)
    rotation=Vector((0,0,1)).rotation_difference(v).to_matrix().to_4x4()
    groups[name]=empty(name,root,C @ Matrix.Translation(v*1.19) @ rotation)
    groups[name]['explode_axis_gltf']=list(axis)
for name in ['SYS_CORE','INTERNAL_FRAME']:
    groups[name]=empty(name,root,C)

def finish(o,name,parent,mat,bevel=.012,segments=4):
    o.name=name;o.parent=parent
    o.data.materials.append(M[mat])
    if bevel:
        b=o.modifiers.new('Precision edge radii','BEVEL');b.width=bevel;b.segments=segments
        b.limit_method='ANGLE'
    n=o.modifiers.new('Area-weighted surface normals','WEIGHTED_NORMAL');n.keep_sharp=True;n.weight=50
    for p in o.data.polygons:p.use_smooth=True
    uv=o.data.uv_layers.new(name='CircuitUV') if not o.data.uv_layers else o.data.uv_layers[0]
    for loop in o.data.loops:
        co=o.data.vertices[loop.vertex_index].co
        uv.data[loop.index].uv=(co.x/2.2+.5,co.y/2.2+.5)
    parts[(parent.name,mat)].append(o)
    return o

def slab(name,parent,size,loc,mat,bevel=.018,segments=5):
    # Bake dimensions directly into vertices; transform scales remain identity.
    x,y,z=[n/2 for n in size]
    verts=[(-x,-y,-z),(x,-y,-z),(x,y,-z),(-x,y,-z),(-x,-y,z),(x,-y,z),(x,y,z),(-x,y,z)]
    faces=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);o.location=loc
    return finish(o,name,parent,mat,bevel,segments)

def rounded(w,h,r,steps=8):
    pts=[]
    for cx,cy,start in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for j in range(steps+1):
            a=math.radians(start+90*j/steps);pts.append((cx+r*math.cos(a),cy+r*math.sin(a)))
    return pts

def ring(name,parent,w,h,band,depth,z,mat,r=.16):
    outer=rounded(w,h,r);inner=rounded(w-2*band,h-2*band,max(.025,r-band));n=len(outer)
    verts=[(x,y,z+zz) for zz in [-depth/2,depth/2] for loop in [outer,inner] for x,y in loop]
    faces=[]
    for i in range(n):
        j=(i+1)%n
        faces += [(i,j,2*n+j,2*n+i),(n+j,n+i,3*n+i,3*n+j),
                  (2*n+i,2*n+j,3*n+j,3*n+i),(j,i,n+i,n+j)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o)
    return finish(o,name,parent,mat,min(.006,depth*.22),2)

def optical_cover(parent):
    # Independent XY silhouette radius and thickness bevel, unlike a bevelled box
    # whose thin Z dimension would clamp the apparent corner radius.
    perimeter=rounded(2.23,2.23,.17,steps=16);n=len(perimeter)
    verts=[(x,y,z) for z in [.0275,.0825] for x,y in perimeter]
    faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh=bpy.data.meshes.new('Optical cover');mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new('Optical cover',mesh);scene.collection.objects.link(o)
    return finish(o,'Optical cover',parent,'MAT_ACRYLIC',.008,3)

def pin(name,parent,x,y,z):
    bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=.022,depth=.016,location=(x,y,z))
    o=bpy.context.object;finish(o,name,parent,'MAT_CHROME',.003,2)
    slab(name+'_slot',parent,(.024,.006,.003),(x,y,z+.009),'MAT_GRAPHITE',.001,2)

for index,(name,g) in enumerate(list(groups.items())[:6]):
    # Nested closed volumes: outer glass, seating gasket, machined rim, open PCB.
    optical_cover(g)
    ring('Machined perimeter',g,2.25,2.25,.055,.105,.002,'MAT_CHROME',.18)
    ring('Recessed graphite gasket',g,2.14,2.14,.042,.06,-.055,'MAT_GRAPHITE',.145)
    ring('Open architecture PCB',g,2.04,2.04,.145,.048,-.104,'MAT_PCB',.12)
    ring('Inner service lip',g,1.76,1.76,.022,.03,-.14,'MAT_CHROME',.07)
    # Front and rear plated contacts; components all share the same parent.
    for x in [-.94,.94]:
        for y in [-.94,.94]: pin('Captive flush fastener',g,x,y,.052)
    for j in range(7):
        slab('Board edge contact',g,(.034,.075,.014),(-.21+j*.07,-.94,-.142),'MAT_CHROME',.004,2)
    # Sparse major paths, with fine circuitry supplied by the shared atlas.
    for side in [-1,1]:
        slab('Data rail',g,(.52,.013,.01),(side*.52,.949,-.073),'MAT_CIRCUIT',.003,3)
        slab('Return bus',g,(.011,.35,.01),(side*.945,-.42,-.136),'MAT_CIRCUIT',.003,3)
    if name=='FACE_WEB':
        # Landscape aperture inside a square mechanical face, never a stretched cube.
        ring('Display backing seat',g,1.80,1.10,.055,.065,-.126,'MAT_GRAPHITE',.11)
        ring('Display retention bezel',g,1.73,1.03,.035,.045,-.09,'MAT_CHROME',.09)
        slab('Smoked interface substrate',g,(1.66,.96,.03),(0,0,-.105),'MAT_SMOKED_GLASS',.014,6)
        for y in [-.70,.70]:
            slab('Interface driver',g,(.68,.12,.07),(0,y,-.123),'MAT_GRAPHITE',.024,5)
        a=empty('WEB_SCREEN_ANCHOR',g,Matrix.Translation((0,0,-.073)))
        a['usable_width']=1.60;a['usable_height']=.90;a['plane']='local XY; normal local +Z'
        a['corner_radius']=.055;a['purpose']='DOM handoff reference; follows FACE_WEB rigidly'
    elif name=='FACE_API':
        for x in [-.57,-.19,.19,.57]:
            slab('Service connector housing',g,(.28,.32,.105),(x,-.78,-.15),'MAT_GRAPHITE',.025,5)
            slab('Recessed service contact',g,(.19,.08,.018),(x,-.83,-.208),'MAT_CHROME',.006,3)
    elif name=='FACE_AI':
        for x in [-.57,.57]:
            for y in [-.77,.77]:
                slab('Accelerator package',g,(.36,.34,.09),(x,y,-.16),'MAT_GRAPHITE',.025,5)
                slab('Accelerator heat lid',g,(.28,.25,.018),(x,y,-.213),'MAT_CHROME',.012,4)
    elif name=='FACE_DATA':
        for x in [-.54,0,.54]:
            slab('Storage lane',g,(.32,.34,.085),(x,.75,-.155),'MAT_GRAPHITE',.022,5)
            slab('Storage bus bridge',g,(.25,.025,.012),(x,.79,-.201),'MAT_CIRCUIT',.005,3)
    elif name=='FACE_SYSTEM':
        for x in [-.65,0,.65]:
            slab('Routing controller',g,(.25,.25,.075),(x,-.79,-.15),'MAT_GRAPHITE',.021,5)
        slab('Control cross bus',g,(1.34,.04,.035),(0,-.67,-.12),'MAT_CHROME',.012,4)
    else:
        for x in [-.65,.65]:
            slab('Power distribution socket',g,(.38,.32,.11),(x,-.78,-.16),'MAT_GRAPHITE',.025,5)
            for k in range(3): slab('Power terminal',g,(.035,.12,.024),(x-.08+k*.08,-.78,-.221),'MAT_CHROME',.006,3)
        slab('Network backplane',g,(1.2,.15,.08),(0,.82,-.15),'MAT_PCB',.02,5)

g=groups['SYS_CORE']
slab('Central compute substrate',g,(1.10,1.10,.09),(0,0,0),'MAT_PCB',.045,7)
slab('Processor package',g,(.78,.78,.17),(0,0,.12),'MAT_GRAPHITE',.065,8)
ring('CPU retention frame',g,.96,.96,.06,.075,.105,'MAT_CHROME',.10)
ring('Cobalt edge channel',g,.81,.81,.018,.018,.203,'MAT_CIRCUIT',.074)
slab('Brushed processor lid',g,(.64,.64,.034),(0,0,.213),'MAT_CHROME',.032,6)
slab('Graphite die inset',g,(.49,.49,.01),(0,0,.234),'MAT_GRAPHITE',.017,4)
# Restrained lid identity, geometry joined into existing chrome draw, no font dependency.
bpy.ops.object.text_add(location=(0,0,.242))
t=bpy.context.object;t.data.body='7388';t.data.align_x='CENTER';t.data.align_y='CENTER';t.data.size=.115;t.data.extrude=.0005
bpy.ops.object.convert(target='MESH')
# Font cap and extrusion loops arrive as coincident but separate vertices.
text_mesh=bpy.context.object.data
bm=bmesh.new();bm.from_mesh(text_mesh)
bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-6)
bm.to_mesh(text_mesh);bm.free();text_mesh.update()
finish(bpy.context.object,'Processor etch 7388',g,'MAT_CHROME',0)
slab('Rear processor heat spreader',g,(.78,.78,.095),(0,0,-.095),'MAT_GRAPHITE',.038,6)
for side in [-1,1]:
    for j in range(6):
        slab('CPU socket pin',g,(.06,.035,.035),(side*.51,-.27+j*.108,.07),'MAT_CHROME',.006,3)
        slab('CPU socket pin',g,(.035,.06,.035),(-.27+j*.108,side*.51,.07),'MAT_CHROME',.006,3)

g=groups['INTERNAL_FRAME']
for y in [-.62,.62]:
    slab('Core carrier bridge',g,(1.42,.075,.12),(0,y,-.21),'MAT_CHROME',.018,4)
# Four slender pillars rather than a dense full cage. Six docking shoes register faces.
for x in [-.82,.82]:
    for y in [-.82,.82]:
        slab('Longitudinal spine',g,(.035,.035,1.70),(x,y,0),'MAT_CHROME',.012,5)
for axis in AXES.values():
    v=Vector(axis)
    o=slab('Radial bus support',g,(.12,.095,.48),tuple(v*.73),'MAT_GRAPHITE',.016,5)
    o.rotation_mode='QUATERNION';o.rotation_quaternion=Vector((0,0,1)).rotation_difference(v)
    o=slab('Bus conductor',g,(.028,.016,.45),tuple(v*.73+Vector((.065,0,0))),'MAT_CIRCUIT',.006,3)
    o.rotation_mode='QUATERNION';o.rotation_quaternion=Vector((0,0,1)).rotation_difference(v)

# Strengthen the processor in-place, baking dimensions rather than changing its
# locked assembly pivot/transform or adding another assembly/material batch.
for (assembly,_),objects in parts.items():
    if assembly=='SYS_CORE':
        for o in objects:
            for vertex in o.data.vertices:
                vertex.co.x*=1.22;vertex.co.y*=1.22;vertex.co.z*=1.65
            o.location.x*=1.22;o.location.y*=1.22;o.location.z*=1.65

# Archive unjoined, non-destructive sources inside .blend, never export them.
bpy.context.view_layer.update()
archive=bpy.data.collections.new('AUTHORING_SOURCES__hidden');scene.collection.children.link(archive)
for objects in parts.values():
    for original in objects:
        backup=original.copy();backup.data=original.data.copy();archive.objects.link(backup)
        backup.name='SOURCE__'+original.name;backup.parent=None;backup.matrix_world=original.matrix_world.copy()
archive.hide_render=True;archive.hide_viewport=True

exported=[]
for (assembly,mat),objects in parts.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:
        bpy.context.view_layer.objects.active=o;o.select_set(True)
        for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
        o.select_set(False)
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1:bpy.ops.object.join()
    joined=bpy.context.object;joined.name=assembly+'__'+mat.removeprefix('MAT_')
    # Bake object-local transforms while preserving the assembly's intentional orientation.
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    exported.append(joined)

# Automated rigid explosion and reconstruction check, in Blender world space.
rest={name:o.matrix_local.copy() for name,o in groups.items()}
for name,axis in AXES.items():groups[name].location += (C.to_3x3() @ Vector(axis))*1.0
bpy.context.view_layer.update()
assert (groups['SYS_CORE'].matrix_local-rest['SYS_CORE']) == Matrix(((0,0,0,0),)*4)
for name,matrix in rest.items():groups[name].matrix_local=matrix
bpy.context.view_layer.update()

report={'asset':'NODE_7388','blender':bpy.app.version_string,'coordinateSystem':'glTF +Y up, +Z WEB; Blender +Z up, -Y WEB',
    'designUnitMeters':1.0,'materials':list(M),'assemblies':[],'meshes':[],'triangleCount':0,
        'anchor':{'path':'NODE_7388/FACE_WEB/WEB_SCREEN_ANCHOR','width':1.60,'height':.90,'normal':'+Z local'},
        'compromises':['Browser acrylic is tuned independently; no claim of physically correct multilayer refraction.',
                       'Fixed docking buses do not telescope in this asset-only preview.',
                       'WEB_SCREEN_ANCHOR is nested under FACE_WEB (not duplicated at root).']}
for name,o in groups.items():
    report['assemblies'].append({'name':name,'parent':'NODE_7388','explodeAxis':AXES.get(name,[0,0,0]),'pivotBlender':list(o.location)})
for o in exported:
    o.data.calc_loop_triangles();count=len(o.data.loop_triangles);report['triangleCount']+=count
    edges=defaultdict(int)
    for polygon in o.data.polygons:
        for edge in polygon.edge_keys:edges[tuple(sorted(edge))]+=1
    boundaries=sum(value==1 for value in edges.values())
    assert boundaries==0, f'Open surface in {o.name}: {boundaries}'
    report['meshes'].append({'name':o.name,'parent':o.parent.name,'triangles':count,'material':o.data.materials[0].name,'boundaryEdges':boundaries})
report['meshCount']=len(exported);report['materialDrawCalls']=len(exported)

# Review camera and lights live outside the export selection.
bpy.ops.object.camera_add(location=C @ Vector((4.8,3.5,6.4)))
camera=bpy.context.object;camera.name='REVIEW_CAMERA'
camera.rotation_euler=(-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.lens=52;scene.camera=camera
for name,position,energy,size in [('Key',(3,5,4),700,5),('Fill',(-4,2,3),450,4),('Rim',(2,3,-4),550,3)]:
    bpy.ops.object.light_add(type='AREA',location=C @ Vector(position))
    light=bpy.context.object;light.name='REVIEW_'+name;light.data.energy=energy;light.data.shape='DISK';light.data.size=size
    light.rotation_euler=(-light.location).to_track_quat('-Z','Y').to_euler()
scene.render.resolution_x=1400;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
bpy.ops.object.select_all(action='DESELECT')
for o in [root,*groups.values(),*exported,a]:o.select_set(True)
bpy.context.view_layer.objects.active=root
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'node-7388.blend'))
# Present an already-Y-up scene to the exporter. This avoids its per-node basis
# conjugation, preserving canonical FACE_WEB and anchor local XY / +Z frames.
# The saved .blend remains normal Z-up, with correct camera and source collection.
for o in groups.values():o.matrix_local=C.inverted() @ o.matrix_local
bpy.context.view_layer.update()
bpy.ops.export_scene.gltf(filepath=str(PUBLIC/'node-7388.glb'),export_format='GLB',use_selection=True,
    export_yup=False,export_apply=True,export_extras=True,export_cameras=False,export_lights=False)
for name,matrix in rest.items():groups[name].matrix_local=matrix
shutil.copy2(PUBLIC/'node-7388.glb',OUT/'node-7388.glb')
report['glbBytes']=(PUBLIC/'node-7388.glb').stat().st_size
(OUT/'hierarchy.json').write_text(json.dumps(report,indent=2))
(PUBLIC/'node-7388-hierarchy.json').write_text(json.dumps(report,indent=2))
print('NODE_7388_REPORT',json.dumps({k:report[k] for k in ['triangleCount','meshCount','materialDrawCalls','glbBytes']}))
